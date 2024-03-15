import {createReadStream} from "fs"
import {} from "form-data"
import path from "path"
export async function POST(){
  const file = createReadStream(path.resolve(__dirname, "..", "..", ))
}
