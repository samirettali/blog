import Document, { Html, Head, Main, NextScript } from "next/document";
import { title } from "../lib/utils";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content="Samir's blog" />
          <meta
            property="og:image"
            content={`https://og-image.now.sh/${encodeURI(
              title()
            )}.png?theme=light&md=0&fontSize=200px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg&widths=0&heights=0`}
          />
          <meta name="og:title" content={title()} />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
