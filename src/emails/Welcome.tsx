import {
  Body,
  Container,
  Head,
  Html,
  Preview,
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
      <Preview>Roses transmis</Preview>
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
              },
            },
          },
        }}
      >
        <Body className="bg-bleu font-roboto font-medium text-white">
          <Container className="mt-8 border border-black p-10 mx-auto">
            <Heading>
              Merci {name} de participer à cette action communautaire
            </Heading>
            <Text className="text-base">
              Vos {quantity} rose(s) se joignent à celles de nombreux autres
              participants, formant un bouquet de bonheur qui saura toucher le
              Cœur de Notre Chère Mère.
            </Text>
            <Text>Merci pour cette promesse</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
