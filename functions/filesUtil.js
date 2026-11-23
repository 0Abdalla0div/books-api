const jwt = require("jsonwebtoken");
const validatebook = (req, res, next) => {
  const data = validateData(req.body);
  if (data.isValid) {
    req.body = data.data
    next();
  } else {
    res
      .status(400)
      .json(data.Errors,);
  }
};
function validateData(data) {
  const errors = {};
  const validData = {};
  if (data.name !== undefined) {
    if (typeof data.name !== "string" || data.name.trim() === "") {
      errors.name = "name must be a non-empty string";
    } else {
      validData.name = data.name.trim();
    }
  }

  if (data.author !== undefined) {
    if (typeof data.author !== "string" || data.author.trim() === "") {
      errors.author = "author must be a non-empty string";
    } else {
      validData.author = data.author.trim();
    }
  }
  if (Object.keys(data).length <= 0) {
    return {
      isValid: false,
      Errors: { error: "validation error", message: "no data was given" },
    };
  }
  if (Object.keys(errors).length > 0) {
    return {
      isValid: false,
      Errors: { error: "validation error", message: errors },
    };
  }
  return { isValid: true, data: validData };
}
function verifyToken(req,res,next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({error:"Verfiycation error",massage:"missing token"});
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({error:"Verfiycation error",massage:"expired or unvalid token",err:err})
  }
}
module.exports = {validateData , validatebook,verifyToken};
