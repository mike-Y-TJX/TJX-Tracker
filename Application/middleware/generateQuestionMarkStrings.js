module.exports = (repeatString, someArray, field) => {
    let finalRepeatString = ""
    let arrayOfFields = []
    someArray.forEach((item, i) => {
        if (i + 1 < someArray.length){
            finalRepeatString += repeatString + ","
        } else {
            finalRepeatString += repeatString
        }	
        var fieldsAndValues = {}
        field.forEach((field) => {
            fieldsAndValues[field] = item[field]
        })
        arrayOfFields.push(
            fieldsAndValues
        )
    })

    return [finalRepeatString, arrayOfFields]
}
