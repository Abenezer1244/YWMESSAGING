import React from 'react';
type CardVariant = 'default' | 'highlight' | 'minimal';
type CardPadding = 'sm' | 'md' | 'lg';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant;
    padding?: CardPadding;
    hoverEffect?: boolean;
    border?: boolean;
}
declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export default Card;
//# sourceMappingURL=Card.d.ts.map