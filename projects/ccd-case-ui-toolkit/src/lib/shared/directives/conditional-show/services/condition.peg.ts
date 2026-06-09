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
    = term:FormulaTerm joins:(JoinComparator)*
      { return [term].concat(flat(joins)); }

  FormulaTerm
    = EnclosedFormula
    / OpenEqualityCheck

  EnclosedFormula
    = openBracket formula:Formula closeBracket
      { return formula.length === 1 ? formula[0] : formula; }

  JoinComparator
    = comp:Comparator term:FormulaTerm
      { return [comp, term]; }

  OpenEqualityCheck
    = fr:FieldRef _? op:operator _? val:Value
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

  FieldRef
   = FieldReference / MetadataFieldReference

  MetadataFieldReference
    = s1:openSquare fr:FieldReference s2:closeSquare
    { return s1 + fr + s2 }

  FieldReference
    = characters:[A-Za-z0-9._-]+ { return characters.join(""); }

  openSquare
   = "["

  closeSquare
   = "]"

  number
   = [0-9]+

  quotedValue
   = '"'val:[A-Za-z0-9.,* _&()/-]*'"'
   { return val.join(""); }

  openBracket
   = _? "(" _?

  closeBracket
   = _? ")" _?

  operator
   = "=" / "!=" / "CONTAINS"

  ws "Whitespace"
   = [ \t]

  _ "One or more whitespaces"
   = ws+

  nl "New line"
   = "\\n"`;

export default generate(conditionSource);
