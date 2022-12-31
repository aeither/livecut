import ClientOnly from "../components/ClientOnly";
declare global {
  interface Window {
    aptos: any;
    martian: any | undefined;
  }
}

export default function Chat() {
  return (
    <ClientOnly>
      <></>
    </ClientOnly>
  );
}
