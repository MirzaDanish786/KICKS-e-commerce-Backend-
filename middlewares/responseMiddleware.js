export const responseMiddleware = (req, res, next) => {
  res.success = (statusCode, message, data = null, ) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  res.error = (statusCode, message)=>{
    return res.status(statusCode).json({
        success: false,
        message
    })
  }
  next();
};
