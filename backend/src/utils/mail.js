import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: 'gmail',
  // port: 587,
  // secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    // type: "OAuth2",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// let mailOptions = {
//   from:  process.env.SMTP_USER,
//   to: 'xesolax942@prorises.com',
//   subject:'Your Exclusive Coupon Code 🎉',
//   text:`Congratulations!

// You’ve received an exclusive coupon from us.

// Coupon Code: ${coupon.code}
// Discount: ${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : ` ${coupon.currency}`}
// Minimum Order: ${coupon.minOrderAmount || 'No minimum order'}
// Valid From: ${coupon.startsAt}
// Valid Until: ${coupon.expiresAt}

// Use this coupon at checkout and enjoy your discount!

// Thank you for shopping with us.`
// };


const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};



export const sendEmailtoUser=(coupon,user)=>{
  
const discountText =
  coupon.discountType === "percentage"
    ? `${coupon.discountValue}% off`
    : `${coupon.currency} ${coupon.discountValue} off`;

const mailOptions = {
  from: process.env.SMTP_USER,
  to: user,
  // to: "xesolax942@prorises.com",
  subject: "Your Exclusive Coupon Code 🎉",

  text: `Congratulations!

You've received an exclusive coupon from us.

🎁 Coupon Details
-------------------------
Coupon Code: ${coupon.code}
Discount: ${discountText}
Minimum Order: ${
    coupon.minOrderAmount
      ? `${coupon.currency} ${coupon.minOrderAmount}`
      : "No minimum order"
  }
Valid From: ${formatDate(coupon.startsAt)}
Valid Until: ${formatDate(coupon.expiresAt)}

Use coupon code ${coupon.code} at checkout to enjoy your discount!

Thank you for shopping with us.
We appreciate your business!`,
};
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}