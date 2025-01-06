import path from 'node:path';
import fs from 'node:fs/promises';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import createHttpError from 'http-errors';

import { randomBytes } from 'crypto';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import {
  FIFTEEN_MINUTES,
  ONE_DAY,
  SMTP,
  TEMPLATES_DIR,
} from '../constans/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';
import { getFullNameFromGoogleTokenPayload } from '../utils/googleOAuth2.js';

//Util Generate Session Func
const generateSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + 30 * ONE_DAY),
  };
};

//Register Func
export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({
    email: payload.email,
  });

  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const encryptedPwd = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPwd,
  });
};

//LogIn func
export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({
    email: payload.email,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const isCorrectPwd = await bcrypt.compare(payload.password, user.password);

  if (!isCorrectPwd) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const newSession = generateSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};

//LogOut Func
export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken: refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  await SessionsCollection.deleteOne({
    _id: sessionId,
    refreshToken,
  });

  const newSession = generateSession();

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

//Send Reset Mail Func
export const sendResetEmail = async ({ email }) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  const resetPwdTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const mailTemplateSourse = (
    await fs.readFile(resetPwdTemplatePath)
  ).toString();

  const template = handlebars.compile(mailTemplateSourse);

  const html = template({
    name: user.name.split(' ')[0],
    link: `${getEnvVar('APP_DOMAIN')}/auth/reset-pwd?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: getEnvVar(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

//Reset Pwd Func
export const resetPwd = async ({ password, token }) => {
  let claims;

  try {
    claims = jwt.verify(token, getEnvVar('JWT_SECRET'));
  } catch {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await UsersCollection.findOne({
    _id: claims.sub,
    email: claims.email,
  });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const encryptedPwd = await bcrypt.hash(password, 10);

  await SessionsCollection.deleteOne({ userId: user._id });

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPwd },
  );
};

//Login With Google OAuth Token Payload
export const SignInOrUpWithGoogle = async (payload) => {
  let user = await UsersCollection.findOne({ email: payload.email });

  if (!user) {
    const encryptedPwd = await bcrypt.hash(randomBytes(10), 10);

    user = await UsersCollection.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password: encryptedPwd,
    });
  }

  const newSession = generateSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};
