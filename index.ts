interface A {
  name: string;
}

const func = <T extends A>(val : T) : T => {
    return val;
}


console.log(func); // { name: "John" }