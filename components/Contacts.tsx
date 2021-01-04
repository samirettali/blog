import React from "react";
import Social from "./Social";
import styles from "../styles/contacts.module.css";

interface ContactProps {
  socials: { [key: string]: string }[];
}

const Contacts: React.FC<ContactProps> = ({ socials }) => {
  return (
    <div className={styles.contacts}>
      {socials.map((social) => {
        const name = Object.keys(social)[0];
        const username = Object.values(social)[0];
        return (
          <div className={styles.icon}>
            <Social key={name} name={name} username={username} />
          </div>
        );
      })}
    </div>
  );
};

export default Contacts;
