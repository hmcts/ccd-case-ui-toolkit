import { generate } from 'pegjs';

const conditionSource =
  `{
    function flat(arr, depth = 1) {
      var flatten = function (arr, depth = 1) {
        if (depth) return arr;

      // Otherwise, concatenate into the parent array
      return arr.reduce(function (acc, val) {
        return acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val);
      }, []);

      };

    return flatten(arr, depth - 1);
    }
  }

  Start
    = Formula

  Formula
    = EnclosedFormula
    / OpenFormula

  EnclosedFormula
    = bracket formula:OpenFormula bracket join:(JoinComparator)*
      { return flat([ [formula], join[0] ], 1) }

  OpenFormula
    = eq:OpenEqualityCheck joins:(JoinComparator)*
      { return flat([ eq, flat(joins) ]) }

  JoinComparator
    = comp:Comparator eq:OpenEqualityCheck
      { return [comp, eq]; }
      / CompoundJoinComparator

  CompoundJoinComparator
    = comp:Comparator bracket f:OpenFormula bracket
      { return [comp, f ] }

  OpenEqualityCheck
    = fr:FieldReference _? op:operator _? val:Value
     { return { fieldReference: fr, comparator: op, value: val } }

  Comparator
   = _? c:'AND' _?
   { return c; }
   / _? c:'OR' _?
   { return c; }

  Word
   = l:Letter+
   { return l.join(""); }

  Letter
   = [a-zA-Z]

  Value
   = v:quotedValue / v:Word
   { return v.join("") }
   / v:number
   { return parseInt(v.join("")) }

  FieldReference
    = characters:[A-Za-z0-9._]+ { return characters.join(""); }

  number
   = [0-9]+

  quotedValue
   = '"'val:[A-Za-z0-9.,* _-]*'"'
   { return val.join(""); }

  bracket
   = (_? "("+ _? / _? ")"+ _? )

  operator
   = "=" / "!=" / "CONTAINS"

  ws "Whitespace"
   = [ \t]

  _ "One or more whitespaces"
   = ws+

  nl "New line"
   = "\\n"`;

export default generate(conditionSource);
