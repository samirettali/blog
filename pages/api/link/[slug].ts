import http from 'http';
import { increaseCounter } from '../../../firebase'

const links = {
  github: "https://github.com/samirettali",
  twitter: "https://twitter.com/samirettali",
  instagram: "https://instagram.com/samirettali",
  linkedin: "https://linkedin.com/in/samirettali",
  photographs: "https://500px.com/p/samirettali",
  nft: "https://rarible.com/samir",
  cv: "https://samir-resume.vercel.app",
};


export default function link(req: http.IncomingMessage, res: http.ServerResponse) {
  const { slug } = req.query;
  if (links[slug]) {
    increaseCounter(slug);
    res.redirect(links[slug])
  } else {
    res.writeHead(404);
    res.end();
  }
}
