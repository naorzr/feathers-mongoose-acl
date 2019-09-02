import { expect } from "chai";
import { AND, OR } from "../lib";
import { HookContext } from "@feathersjs/feathers";

describe("Method testings", () => {
  describe("AND method testing", () => {
    it("should return a valid criteria object", () => {
      const fakeContext = {} as HookContext;
      const condition1 = () => ({ field: "value1" });
      const condition2 = () => ({ field2: "value2" });
      const res = AND(condition1, condition2)(fakeContext);
      expect(res).to.deep.equals({ $and: [condition1(), condition2()] });
    });
  });

  describe("OR method testing", () => {
    it("should return a valid criteria object", () => {
      const fakeContext = {} as HookContext;
      const condition1 = () => ({ field: "value1" });
      const condition2 = () => ({ field2: "value2" });
      const res = OR(condition1, condition2)(fakeContext);
      expect(res).to.deep.equals({ $or: [condition1(), condition2()] });
    });
  });

  describe("nesting methods", () => {
    it("should create a suiting criteria when nesting methods operations", () => {
      const fakeContext = {} as HookContext;
      const condition1 = () => ({ field: "value1" });
      const condition2 = () => ({ field2: "value2" });
      const condition3 = () => ({ field3: "value3" });
      const res = AND(condition3, OR(condition1, condition2))(fakeContext);
      expect(res).to.deep.equals({
        $and: [condition3(), { $or: [condition1(), condition2()] }]
      });
    });
  });
});
