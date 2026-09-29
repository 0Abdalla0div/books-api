const { readFile, writeFile } = require("node:fs").promises;
const path = require("node:path");
const filebath = path.join(__dirname, "/Books.json");
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
let loaddata = async () => {
  try {
    let Books;
    let id;
    Books = await readData();
    id = Books[Books.length - 1].id;
    return { book: Books, ID: id };
  } catch (err) {
    throw new Error(`Failed to load data: ${err.message}`);
  }
};
async function readData() {
  const data = await readFile(filebath, "utf-8");
  let paresdData = JSON.parse(data);
  return paresdData;
}
async function WriteData(Data) {
  try {
    let data = JSON.stringify(Data);
    await writeFile(filebath, data, "utf-8");
  } catch (err) {
    throw new Error(`Failed to write data: ${err.message}`);
  }
}
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
module.exports = { readData, WriteData, loaddata, validateData , validatebook};
