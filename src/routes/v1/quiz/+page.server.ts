// server load svelte +page.server.ts
//

export async function load({ params, query }: { params: any, query: any }) {
  return {
    title: 'Hello World',
  }
}
