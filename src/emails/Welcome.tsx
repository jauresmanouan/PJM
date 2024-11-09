import {
  Body,
  Container,
  Head,
  Html,
  Tailwind,
  Text,
  Heading,
} from "@react-email/components";

export default function Welcome({
  name,
  quantity,
}: {
  name: string;
  quantity: number;
}) {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Tailwind
        config={{
          theme: {
            extend: {
              fontFamily: {
                roboto: ["Roboto", "sans-serif"],
              },
              colors: {
                jaune: "#F39200",
                bleu: "#0A71B8",
                grisClair: "#f0f4f8",
              },
            },
          },
        }}
      >
        <Body className="font-roboto text-bleu">
          <Container className="pl-8 pr-8 mx-auto mt-10 max-w-md">
            <Heading as="h2" className="text-2xl font-bold mb-4 text-bleu">
              Merci <span className="text-jaune">{name}</span> de participer à cette action communautaire
            </Heading>
            <Text className="text-base text-gray-700 mb-4">
              Vos <span className="font-semibold text-jaune">{quantity}</span> rose(s) se joignent à celles de nombreux autres
              participants, formant un bouquet de bonheur qui saura réjouir le
              Cœur de Notre Chère Mère.
            </Text>
            <Text className="text-base text-gray-700 mb-4">
              Merci encore pour cet engagement.
            </Text>
            <Text className="text-sm font-light text-gray-500 italic mt-20 text-end">
              "Portée par la Petite Thérèse 🌹"
            </Text>
            <Text className="text-xs font-bold text-bleu mt-32 text-center no-underline">
              contact@pourlajoiedemarie.com
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
