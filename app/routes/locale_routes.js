const ObjectID = require('mongodb').ObjectID
const { ERROR_CODES_MAP } = require('../constants/codes')
const sendRes = require('../constants/sendRes')
const sendErr = require('../constants/sendErr')

module.exports = function (app, collection) {
  app.post('/addLocale/:projectId', (req, res) => {
    const { projectId } = req.params
    const { locale } = req.body
    const { invalid_locale, duplicate_locale } = ERROR_CODES_MAP

    const localeRegex = /^[a-z]{2}$/gi
    const key = `translations.${locale}`

    const params = {
      filter: {
        _id: new ObjectID(projectId),
        [key]: { $exists: false },
      },
      update: { $set: { [key]: {} } },
      options: { returnOriginal: false },
    }

    if (!localeRegex.test(locale)) {
      sendErr({ res, err: invalid_locale })
    } else {
      collection
        .findOneAndUpdate(params.filter, params.update, params.options)
        .then((result) => {
          const { value } = result

          if (value === null) {
            sendErr({ res, err: duplicate_locale })
          } else {
            sendRes({ res, data: value })
          }
        })
        .catch((err) => sendErr({ res, err }))
    }
  })

  app.delete('/deleteLocale/:projectId/:locale', (req, res) => {
    const { projectId, locale } = req.params
    const key = `translations.${locale}`

    const params = {
      id: { _id: new ObjectID(projectId) },
      query: { $unset: { [key]: 1 } },
    }

    collection
      .update(params.id, params.query)
      .then((result) => sendRes({ res, data: result.result }))
      .catch((err) => sendErr({ res, err }))
  })
}
