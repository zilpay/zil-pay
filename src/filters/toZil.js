import { units } from '@zilliqa-js/util'


export default function (value) {
  console.log(units.Units)

  
  return units.fromQa(value, units.Units.Li);
}
    