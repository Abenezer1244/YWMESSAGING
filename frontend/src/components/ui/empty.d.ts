import { type VariantProps } from "class-variance-authority";
declare function Empty({ className, ...props }: React.ComponentProps<"div">): any;
declare function EmptyHeader({ className, ...props }: React.ComponentProps<"div">): any;
declare const emptyMediaVariants: any;
declare function EmptyMedia({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>): any;
declare function EmptyTitle({ className, ...props }: React.ComponentProps<"div">): any;
declare function EmptyDescription({ className, ...props }: React.ComponentProps<"p">): any;
declare function EmptyContent({ className, ...props }: React.ComponentProps<"div">): any;
export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia, };
//# sourceMappingURL=empty.d.ts.map