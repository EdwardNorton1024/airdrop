import collection_url from '../config/collection_url.json';
import * as fs from 'fs';
import * as path from 'path';
import type {
  I_COLLECTION_URL_RESULT,
  I_WALLET_WHITE_LIST,
} from 'src/interface/airdrop';

if (!collection_url) {
  console.log('/config/collection_url.json not found');
  process.exit(1);
}

const wallet_map: Record<string, I_WALLET_WHITE_LIST> = {};
const fetch_promise: Promise<any>[] = [];
init();

function init() {
  Object.entries(collection_url).forEach(
    async ([collection_name, collection_url]) => {
      console.log(`Get ====>[${collection_name}]`);

      const fetch_promise_item = fetch(collection_url)
        .then((res) => res.json())
        .then((res: I_COLLECTION_URL_RESULT[]) => {
          update_wallet_map(collection_name, res);
          console.log(`Done ====>[${collection_name}]`);
        })
        .catch((err) => {
          return { err, collection_name };
        });

      fetch_promise.push(fetch_promise_item);
    },
  );
  Promise.all(fetch_promise).then((res) => {
    const fetch_err_list = res.filter(Boolean);
    fetch_err_list.forEach(({ err, collection_name }) =>
      console.log(`Error ====>[${collection_name}] :${err}`),
    );
    if (fetch_err_list.length > 0) save_wallet_map();
  });
}
function update_wallet_map(
  collection_name: string,
  collection_url_result: I_COLLECTION_URL_RESULT[],
) {
  collection_url_result.forEach((collection_url_result) => {
    const { wallet, inscriptions, inscriptions_count } = collection_url_result;
    if (!wallet_map[wallet]) {
      wallet_map[wallet] = {
        inscriptions_count,
        collections: {
          [collection_name]: inscriptions,
        },
      };
    } else {
      wallet_map[wallet].inscriptions_count += inscriptions_count;
      wallet_map[wallet].collections[collection_name] = inscriptions;
    }
  });
}
function save_wallet_map() {
  const path_str = path.join(__dirname, '../src/assets');
  const file_name = 'wallet_white_list.json';
  const path_integrity = `${path_str}${path.sep}${file_name}`;
  const content = JSON.stringify(wallet_map);
  fs.mkdirSync(path_str, { recursive: true });
  fs.writeFile(path_integrity, content, (err) => {
    if (err) {
      console.log('wallet_map.json save failed');
      process.exit(1);
    } else {
      console.log(`${file_name} save at ${path_str}`);
    }
  });
}
