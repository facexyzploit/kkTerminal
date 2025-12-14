import { localStore } from "@/env/Store";
import { localStoreUtil } from "@/utils/Cloud";
import { aesDecrypt, aesEncrypt } from "@/utils/Encrypt";

// 版本号
const current = document.querySelector('meta[name="version"]')?.getAttribute('content');
const previous = localStoreUtil.getItem(localStore['version']);

// 3.7.6以上版本新增
const setupCompatFixes = () => {
    if(current === previous) return;
    for(const fix of fixesChain) {
        if(!previous || previous <= fix.version) fix.action();
    }
    localStoreUtil.setItem(localStore['version'], current);
};

export default setupCompatFixes;

// 兼容3.7.6及以下版本
const fixFor376 = () => {
    if(localStoreUtil.getItem(localStore['env'])) {
        const env = JSON.parse(aesDecrypt(localStoreUtil.getItem(localStore['env'])));
        if(!('cmdcode' in env)) {
            if('tCode' in env) env.cmdcode = env.tCode;
            else env.cmdcode = true;
        }
        delete env.tCode;
        localStoreUtil.setItem(localStore['env'], aesEncrypt(JSON.stringify(env)));
    }
    const transItems = [
        { from: 'tcodes', to: 'cmdcodes' },
        { from: 'tcode-local-vars', to: 'cmdcode-vars' },
        { from: 'tcode-draft', to: 'cmdcode-draft' },
    ];
    for(const transItem of transItems) {
        if(localStoreUtil.getItem(transItem.from)) {
            localStoreUtil.setItem(localStore[transItem.to], localStoreUtil.getItem(transItem.from));
            localStoreUtil.removeItem(transItem.from);
        }
    }
};

const fixesChain = [
    { version: "3.7.6", action: fixFor376 },
];
