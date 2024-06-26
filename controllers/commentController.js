const SuccessHandler = require("../utils/successHandler");
const ErrorHandler = require("../utils/errorHandler");
const commentsService = require("../services/commentService");
const asyncHandler = require("express-async-handler");
const checkRequiredFields = require("../helpers/checkRequiredFields");
const { STATUSCODE } = require("../constants/index");
const { upload } = require("../utils/cloudinary");

exports.getAllComments = asyncHandler(async (req, res, next) => {
  const comments = await commentsService.getAllCommentData();

  return comments?.length === STATUSCODE.ZERO
    ? next(new ErrorHandler("No comments found"))
    : SuccessHandler(
        res,
        `Comments with comment ${comments
          .map((p) => p?.text)
          .join(", ")} and IDs ${comments
          .map((p) => p?._id)
          .join(", ")} retrieved`,
        comments
      );
});

exports.getSingleComment = asyncHandler(async (req, res, next) => {
  const comment = await commentsService.getSingleCommentData(req.params.id);

  return !comment
    ? next(new ErrorHandler("No comment found"))
    : SuccessHandler(
        res,
        `Comment ${comment?.text} with ID ${comment?._id} retrieved`,
        comment
      );
});

exports.createNewComment = [
  upload.array("image"),
  checkRequiredFields(["ratings", "text", "product"]),
  asyncHandler(async (req, res, next) => {
    const comment = await commentsService.CreateCommentData(req);

    return SuccessHandler(
      res,
      `New comment ${comment?.text} created with an ID ${comment?._id}`,
      comment
    );
  }),
];

exports.updateComment = [
  upload.array("image"),
  checkRequiredFields(["ratings", "text"]),
  asyncHandler(async (req, res, next) => {
    const comment = await commentsService.updateCommentData(
      req,
      res,
      req.params.id
    );

    return SuccessHandler(
      res,
      `Comment ${comment?.text} with ID ${comment?._id} is updated`,
      comment
    );
  }),
];

exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await commentsService.deleteCommentData(req.params.id);

  return !comment
    ? next(new ErrorHandler("No comment found"))
    : SuccessHandler(
        res,
        `Comment ${comment?.text} with ID ${comment?._id} is deleted`,
        comment
      );
});
