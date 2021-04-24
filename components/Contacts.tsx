import React from "react";
import Icon from "./Icon";

import { Link } from "../lib/config";

interface Props {
  links: Link[];
  className?: string;
}

const Contacts: React.FC<Props> = ({ links, className }) => {
  return (
    <div className={`flex flex-row justify-center w-full ${className || ''}`}>
      {
        links.map(({ name, href, iconName }) => {
          return (
            <div className='p-3' key={name}>
              <a href={href} target='blank'>
                <Icon name={iconName as any} />
              </a>
            </div>
          );
        })
      }
    </div >
  );
};

export default Contacts;
