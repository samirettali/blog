import React from "react";
import * as icons from "react-feather";

export type IconName = keyof typeof icons;

export type IconProps = {
  name: IconName;
} & icons.IconProps;
// } & icons.Props;

const names = Object.keys(icons);

const Icon = ({ name, ...rest }: IconProps) => {
  const realName: string[] = names.filter(
    (n) => n.toLowerCase() === name.toLowerCase()
  );

  if (!realName || realName.length !== 1) {
    return null;
  }

  const IconComponent = (icons as any)[realName[0]];
  return <IconComponent {...rest} />;
};

export default Icon;
