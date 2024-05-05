# emailTemplate

Basic email templating system in Node.js.

This version of the component pulls SMTP credentials from the environment variables.  These environment variables need to be set in order to run the component:

vUser - Right now Google
vPW - Device PW for Google Mail

When running this component listes on port 3000.

#Sample JSON Input
```
{
  "vTitle": "Test Title",
  "vBody": "Test Body",
  "vTo": "Outbound@gmail.com",
  "CommunicationsName": "Test Communications Name",
  "TemplateName": "Default",
  "vRecepient": "rick.vosteen.testing@gmail.com",
  "vSubject": "Test Subject",
  "vParameters": [
    {
      "name": "vMsgTitle",
      "value": "Test Message Title"
    },
    {
      "name": "vMsgBody",
      "value": "Test Message Body"
    }
  ]
}
```

#Curl Command to Run
```
curl -X POST http://localhost:3000/sendEmail \
-H 'Content-Type: application/json' \
-d '{
  "vTitle": "Test Title",
  "vBody": "Test Body",
  "vTo": "rick.vosteen.testing@gmail.com",
  "CommunicationsName": "Test Communications Name",
  "TemplateName": "Default",
  "vRecepient": "rick.vosteen.testing@gmail.com",
  "vSubject": "Test Subject",
  "vParameters": [
    {
      "name": "vMsgTitle",
      "value": "Test Message Title"
    },
    {
      "name": "vMsgBody",
      "value": "Test Message Body"
    }
  ]
}'
```
