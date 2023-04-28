export default function queue() {
    let array = [];
    return {
        pushTail: value => array.push(value),
        pullHead: () => array.shift(),
        isEmpty: () => array.length === 0
    };
}