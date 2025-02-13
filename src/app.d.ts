// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {


  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  type Paper = {
    batch: string | null;
    title: string | null;
    subject: string | null;
    url: string | null;
    thumbnail: string | null;
  }

  type Lecture = {
    title: string | null;
    batch: string | null;
    lecturer: string | null;
    location: {
      hall: string | null;
      floor: string | null;
    };
    offset: number | 0;
    time: {
      start: string | null;
      end: string | null;
    }
    properties: {
      is_exam: boolean | false;
      branch: string | "ANY";
    };
  }


}

export { };
