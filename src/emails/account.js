const sgMail=require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'kkunalguptaaa@gmail.com', /*we can use any account but they count how many times mail got spamed and
                                        reduces our reputation*/ 
        subject:'Thanks for joining us!',
        text:`We welocmed you in organisation. Hoping Mr.${name} you will enjoy our services`
    })
    
}
const sendExitEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'kkunalguptaaa@gmail.com',
        subject:'We Applogise if You faced any problem!',
        text:`We will pay more attentention. Hoping Mr.${name} you can enjoy our services again.` /* `` is template
                                            string and in which we can use variable easily just like concatenation.*/
    })
    
}
module.exports={        /*this is how we return multiple things and we can use destructuring while importing them
                         to work them0 easily e.g. {sendWelcomeEmail}=require('./email/account')*/  
    sendWelcomeEmail,
    sendExitEmail
}