import { oneHourReminderTemplate} from '../modules/email'

export const sendOneHourEmailReminder = async (event) => {

    let message
    try {
        message = await oneHourReminderTemplate(event)
    } catch (error) {
        console.log('error making one hour reminder template', error)
     }

    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        await sgMail.send(message)
        return res.send('one hour reminder message sent')
      } catch (error) {
        console.log('Something went wrong sending the one hour reminder email', error)
      }
}