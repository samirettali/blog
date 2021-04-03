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
            content="/images/preview.png"
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
