

var Lazy = require('lazy.js');


var mergeNodes = (left, right) => {
  var mergeChildren = (leftChildren, rightChildren) => {
    leftChildren = leftChildren || [];
    rightChildren = rightChildren || [];
    var mergedChildren = null;
    if (leftChildren.length && rightChildren.length) {
      mergedChildren = [];
      // rightChildren are more likely to contain new variables, since reforms tend to add variables, not remove.
      rightChildren.forEach((rightChild) => {
        var correspondingLeftChild = leftChildren.find((leftChild) => leftChild.name === rightChild.name);
        mergedChildren.push(
          correspondingLeftChild ? mergeNodes(correspondingLeftChild, rightChild) : rightChild
        );
      });
      // Remaining variables in leftChildren, in case a reform removes variables.
      leftChildren.forEach((leftChild) => {
        var mergedVariable = mergedChildren.find((variable) => variable.name === leftChild.name);
        if (typeof mergedVariable === 'undefined') {
          mergedChildren.push(leftChild);
        }
      });
    } else if (leftChildren.length) {
      mergedChildren = leftChildren;
    } else if (rightChildren.length) {
      mergedChildren = rightChildren;
    } else {
      mergedChildren = null;
    }
    return mergedChildren;
  };
  var merged = Object.assign({}, left, right);
  merged.children = mergeChildren(left.children, right.children);
  merged.values = Lazy(left.values).zip(right.values).map((values) => values[1] - values[0]).toArray();
  return merged;
};


module.exports = {mergeNodes};
