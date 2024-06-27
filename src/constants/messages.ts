export const USERS_MESSAGES = {
  VALIDATE_ERROR: 'Validation Error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Refresh token is used or not exist',
  LOGIN_SUCCESSFULLY: 'Login successfully',
  REGISTER_SUCCESSFULLY: 'Register successfully',
  LOGOUT_SUCCESSFULLY: 'Logout successfully',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFIED_SUCCESSFULLY: 'Email verified successfully',
  EMAIL_VERIFY_TOKEN_IS_NOT_EXIST: 'Email verify token is not exist',
  EMAIL_VERIFY_TOKEN_IS_INVALID: 'Email verify token is invalid',
  EMAI_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  USER_NOT_FOUND: 'User not found',
  RESEND_VERIFY_EMAIL_SUCCESSFULLY: 'Resend verify email successfully',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot password token is invalid',
  VERIFY_FORGOT_PASSWORD_SUCCESSFULLY: 'Verify forgot password successfully',
  GET_ME_SUCCESSFULLY: 'Get my profile successfully',
  USER_NOT_VERIFIED: 'User not verified',
  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH: 'Bio length muse be from 1 to 200',
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH: 'Location length muse be from 1 to 200',
  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH: 'Website length muse be from 1 to 200',
  USERNAME_MUST_BE_A_STRING: 'Usernme must be a string',
  USERNAME_INVALID: 'Username must be 4-15 characters long and contain only letters, numbers and underscores',
  IMAGE_URL_MUST_BE_A_STRING: 'Image url must be a string',
  IMAGE_URL_LENGTH: 'Image url length muse be from 1 to 400',
  UPDATE_ME_SUCCESSFULLY: 'Update my profile successfully',
  GET_USER_PROFILE_SUCCESSFULLY: 'Get user profile successfully',
  FOLLOW_SUCCESSFULLY: 'Follow successfully',
  INCORRECT_FORMAT_OBJECT_ID: 'Incorrect format ObjectId',
  USER_IS_FOLLOWED_BEFORE: 'User is followed before',
  USER_IS_NOT_FOLLOWED_BEFORE: 'User is not followed before',
  UNFOLLOW_SUCCESSFULLY: 'Unfollow successfully',
  USERNAME_EXISTED: 'Username existed',
  OLD_PASSWORD_NOT_MATCH: 'Old password not match',
  CHANGE_PASSWORD_SUCCESSFULLY: 'Change password successfully',
  GMAIL_IS_NOT_VERIFIED: 'Gmail is not verified',
  UPLOAD_SUCCESSFULLY: 'Upload successfully',
  REFRESH_TOKEN_SUCCESSFULLY: 'Refresh token successfully'
} as const

export const TWEETS_MESSAGES = {
  INVALID_TYPE: 'Invalid type',
  INVALID_AUDIENCE: 'Invalid audience',
  PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'Parent id must be a valid tweet id',
  PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
  CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non empty string',
  CONTENT_MUST_BE_AN_EMPTY_STRING: 'Content must be an empty string',
  HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING: 'Hashtags must be an array of string',
  MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID: 'Mentions must be an array of user id',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Media must be an array media object',
  INVALID_TWEET_ID: 'Invalid Tweet id',
  TWEET_NOT_FOUND: 'Tweet not found',
  TWEET_IS_NOT_PUBLIC: 'Tweet is not public',
  GET_TWEET_SUCCESSFULLY: 'Get Tweet Successfully'
} as const

export const BOOKMARKS_MESSAGES = {
  BOOKMARK_TWEET_SUCCESSFULLY: 'Bookmark Tweet Successfuly',
  UNBOOKMARK_TWEET_SUCCESSFULLY: 'Unbookmark Tweet Successfuly'
} as const

export const LIKES_MESSAGES = {
  LIKE_TWEET_SUCCESSFULLY: 'Like Tweet Successfuly',
  UNLIKE_TWEET_SUCCESSFULLY: 'Unlike Tweet Successfuly'
} as const
