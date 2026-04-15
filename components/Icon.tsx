import * as icons from "lucide-react";

export type IconName = keyof typeof icons;

type IconProps = {
  name: string;
} & icons.LucideProps;

const iconNames = Object.keys(icons);

export default function Icon({ name, ...rest }: IconProps) {
  const realName = iconNames.find((iconName) => iconName.toLowerCase() === name.toLowerCase());

  if (!realName) {
    return null;
  }

  const IconComponent = icons[realName as IconName] as React.ComponentType<icons.LucideProps>;
  return <IconComponent {...rest} />;
}
