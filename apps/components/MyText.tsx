import { ComponentType, ReactNode } from "react";
import { Text } from "react-native";

export const MyText = <C extends ComponentType<any>>({ as, children, style, ...props }: { as?: C, children?: ReactNode, style?: any }) => {
    const Component = as || Text;
    return <Component style={style} {...props}>{children}</Component>;
};
