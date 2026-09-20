/// <reference types="react" />

// Additional ambient declarations
declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}
