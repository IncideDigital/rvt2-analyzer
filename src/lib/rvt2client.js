const FileDownload = require("js-file-download");
const axios = require("axios");

/** Converts data sent by a rvt2 server into an array.
 *
 * The rvt2 server sends lines of json files: they must be converted to arrays before they can be used.
 */
export function data2array(data) {
  let output = [];
  let lines = data.split("\n");
  lines.forEach(line => {
    if (line.length > 0) {
      output.push(JSON.parse(line));
    }
  });
  return output;
}

/** Get information about a directory */
export class RVT2Client {
  constructor(server, casename, source) {
    this.server = server;
    this.casename = casename;
    this.source = source;
  }

  async getDirectory(dirname) {
    let data = await axios.get(
      `${this.server}/${this.casename}/${this.source}/${dirname}`
    );
    this.dirname = data.data.dirname;
    if (data.data.parent !== null && data.data.parent !== undefined) {
      // the directory has a parent
      return {
        dirname: data.data.dirname,
        content: [{ name: "..", type: "directory" }, ...data.data.items],
        parent: data.data.parent
      };
    }
    // top directory
    return {
      dirname: data.data.dirname,
      content: data.data.items,
      parent: null
    };
  }

  toServerPath(dirname, filename) {
    let abspath;
    if (dirname) {
      abspath = `${dirname}/${filename}`;
    } else {
      abspath = filename;
    }
    return `${this.server}/${this.casename}/${this.source}/${abspath}`;
  }

  /** Download a file */
  async downloadFile(dirname, filename) {
    axios.get(this.toServerPath(dirname, filename)).then(response => {
      FileDownload(response.data, filename);
    });
  }
}
