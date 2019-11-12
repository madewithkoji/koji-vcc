/** Value: Person */
export const title = () => string;
/** Value: object */
export const type = () => string;
export const properties = {
  firstName: {
    /** Value: string */
    type: () => string
  },
  lastName: {
    /** Value: string */
    type: () => string
  },
  age: {
    /** Value: Age in years */
    description: () => string,
    /** Value: integer */
    type: () => string,
    /** Value: 0 */
    minimum: () => number
  },
  hairColor: {
    enum: [
      /** Value: black */
      0: () => string,
      /** Value: brown */
      1: () => string,
      /** Value: blue */
      2: () => string
    ],
    /** Value: string */
    type: () => string
  }
};
/** Value: false */
export const required = () => boolean;
export const serviceMap = {

};
export const metadata = {
  /** Value: 00000000-0000-0000-0000-000000000000 */
  projectId: () => string
};