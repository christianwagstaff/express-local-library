const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxlength: 100 },
  family_name: { type: String, required: true, maxlength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for Author's Full Name
AuthorSchema.virtual("name").get(function () {
  // To avoid errors where author doesn't have a first or last name
  // We want to handle this exception by returning an empty string
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name || ""}, ${this.first_name || ""}`;
  }
  return fullname;
});

// Virtual for Author's Life Span
AuthorSchema.virtual("lifespan").get(function () {
  let lifetime_string = "";
  lifetime_string += this.date_of_birth
    ? DateTime.fromJSDate(this.date_of_birth, {zone: "utc"}).toLocaleString(DateTime.DATE_MED)
    : "";
  lifetime_string += " - ";
  lifetime_string += this.date_of_death
    ? DateTime.fromJSDate(this.date_of_death, {zone: "utc"}).toLocaleString(DateTime.DATE_MED)
    : "";

  return lifetime_string;
});

// Virtual for Author's URL
AuthorSchema.virtual("url").get(function () {
  return `/catalog/author/${this._id}`;
});

// Virtual for Author's Date of Birth Formated
AuthorSchema.virtual("date_of_birth_formatted").get(function () {
  return this.date_of_birth
    ? DateTime.fromJSDate(this.date_of_birth, {zone: "utc"}).toLocaleString(DateTime.DATE_MED)
    : "";
});

// Virtual for Author's Date of Death Formated
AuthorSchema.virtual("date_of_death_formatted").get(function () {
  return this.date_of_death
    ? DateTime.fromJSDate(this.date_of_death, {zone: "utc"}).toLocaleString(DateTime.DATE_MED)
    : "";
});

// Virtual for Author's Date of Birth Formated for Form
AuthorSchema.virtual("date_of_birth_formatted_form").get(function () {
  return this.date_of_birth
    ? DateTime.fromJSDate(this.date_of_birth, { zone: "utc" }).toFormat(
        "yyyy-MM-dd"
      )
    : "";
});

// Virtual for Author's Date of Death Formated for Form
AuthorSchema.virtual("date_of_death_formatted_form").get(function () {
  return this.date_of_death
    ? DateTime.fromJSDate(this.date_of_death, { zone: "utc" }).toFormat(
        "yyyy-MM-dd"
      )
    : "";
});

module.exports = mongoose.model("Author", AuthorSchema);
