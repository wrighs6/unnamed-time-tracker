import "solid-js";

declare module "solid-js" {
  namespace JSX {
    // interface CustomAttributes<T> {
    //   // Allows attr:value, attr:checked, attr:placeholder, etc.
    //   [key: `attr:${string}`]: any
    // }
    interface ExplicitAttributes {
      value: string
    }
  }
}
