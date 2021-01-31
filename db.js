const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Схема данных
const TextScheme = new Schema({
    link: String,
    text: String
});

// Подключение
mongoose.connect("mongodb://localhost:27017/scrapping", { useNewUrlParser: true });

// Переменная модели данных
const Text = mongoose.model("Text", TextScheme);

// Сохранение текстов в БД
exports.saveTexts = (texts) => {
    Text.insertMany(texts).then((val) => {
        console.log('Data saved')
    }).catch(err => {
        console.log(err)
    })
}