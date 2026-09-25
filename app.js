const form = document.getElementById("conversation-form");
const topicInput = document.getElementById("topic");
const backgroundInput = document.getElementById("background");
const thoughtsInput = document.getElementById("thoughts");
const goalInput = document.getElementById("goal");
const resultOutput = document.getElementById("result");
const copyButton = document.getElementById("copy-button");
const copyStatus = document.getElementById("copy-status");
const resultCard = document.querySelector(".result-card");

/**
 * 入力値の前後の空白を取り除く。
 * 未入力の場合は空文字列を返す。
 */
function getTrimmedValue(element) {
  return element.value.trim();
}

/**
 * 前提の共有状況を取得する。
 * 未選択の場合は空文字列を返す。
 */
function getSharingStatus() {
  const selected = document.querySelector(
    'input[name="sharing-status"]:checked'
  );

  return selected ? selected.value : "";
}

/**
 * 見出しと本文をひとまとまりのテキストにする。
 */
function createSection(title, body, suffix = "") {
  const heading = suffix
    ? `【${title}】（${suffix}）`
    : `【${title}】`;

  return `${heading}\n${body}`;
}

/**
 * 入力内容から持ち出し用のテキストを生成する。
 */
function generateText() {
  const topic = getTrimmedValue(topicInput);
  const background = getTrimmedValue(backgroundInput);
  const thoughts = getTrimmedValue(thoughtsInput);
  const goal = getTrimmedValue(goalInput);
  const sharingStatus = getSharingStatus();

  const sections = [
    createSection("話したいこと", topic),
    createSection("前提", background, sharingStatus),
    createSection("私の考え", thoughts),
    createSection("今回したいこと", goal)
  ];

  return sections.join("\n\n");
}

/**
 * 生成結果を画面へ表示する。
 */
function displayGeneratedText() {
  const generatedText = generateText();

  resultOutput.value = generatedText;
  copyButton.disabled = generatedText.length === 0;
  copyStatus.textContent = "";

  resultCard.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/**
 * Clipboard APIが使えない環境向けのコピー処理。
 */
function fallbackCopy(text) {
  const temporaryTextarea = document.createElement("textarea");

  temporaryTextarea.value = text;
  temporaryTextarea.setAttribute("readonly", "");
  temporaryTextarea.style.position = "fixed";
  temporaryTextarea.style.opacity = "0";

  document.body.appendChild(temporaryTextarea);
  temporaryTextarea.select();

  const copied = document.execCommand("copy");

  document.body.removeChild(temporaryTextarea);

  return copied;
}

/**
 * 生成結果をクリップボードへコピーする。
 */
async function copyGeneratedText() {
  const text = resultOutput.value;

  if (!text) {
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const copied = fallbackCopy(text);

      if (!copied) {
        throw new Error("コピーに失敗しました。");
      }
    }

    copyStatus.textContent = "コピーしました";
  } catch (error) {
    console.error(error);
    copyStatus.textContent = "コピーできませんでした";
  }
}

/**
 * フォーム送信時にページ遷移を止め、結果を生成する。
 */
form.addEventListener("submit", (event) => {
  event.preventDefault();
  displayGeneratedText();
});

/**
 * コピーボタン押下時に生成結果をコピーする。
 */
copyButton.addEventListener("click", copyGeneratedText);
