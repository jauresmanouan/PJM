import emailjs from "emailjs-com";

export const SendEmail = async ({
  name,
  quantity,
  email,
}: {
  name: string;
  quantity: number;
  email: string;
}): Promise<void> => {
  try {

    const response = await emailjs.send(
      "service_b0f9y9p",
      "template_cah1wzr",
      {
        name,
        quantity,
        email,
      },
      "UxVsI42f_-yYz95gE"
    );

    console.log("Email envoyé avec succès :", response.status, response.text);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
  }
};
