export const WISH_TEMPLATES = {
  emotional: [
    (name) => `Chúc mừng sinh nhật ${name}! Cảm ơn vì đã xuất hiện và làm cho cuộc sống này thêm ấm áp. Chúc bạn tuổi mới luôn an yên, hạnh phúc và được yêu thương đong đầy.`,
    (name) => `Gửi ${name} yêu thương, chúc bạn một ngày sinh nhật ngập tràn ánh nắng và nụ cười. Mong mọi ước mơ ấp ủ từ lâu sẽ dần thành hiện thực rực rỡ nhất!`,
    (name) => `Chúc ${name} tuổi mới luôn giữ được vẻ dịu dàng trong ánh mắt và sự bình an trong tâm hồn. Sinh nhật thật ấm áp bên những người thương yêu nhé!`,
  ],
  warm: [
    (name) => `Happy Birthday ${name}! Mong tuổi mới đem đến cho bạn thật nhiều chuyến đi mới, những cuốn sách hay và những khoảnh khắc đáng nhớ bên bạn bè.`,
    (name) => `Gửi tới ${name} những lời chúc chân thành nhất. Tuổi mới chúc bạn luôn khỏe mạnh, tự tin theo đuổi đam mê và gặt hái thật nhiều quả ngọt!`,
  ],
  poetic: [
    (name) => `Chúc mừng sinh nhật ${name}. Mong năm tháng dịu dàng với bạn, mong mỗi sớm mai thức dậy lòng bạn đều ngập tràn niềm vui và sự an lành.`,
    (name) => `Thêm một tuổi mới là thêm một trang sách rực rỡ. Chúc ${name} vẽ nên những chương đời đẹp đẽ và hạnh phúc nhất!`,
  ],
};

export const WISH_STYLES = [
  { id: 'emotional', label: 'Ấm áp & Chân thành' },
  { id: 'warm', label: 'Tươi vui & Khích lệ' },
  { id: 'poetic', label: 'Thơ mộng & Lắng đọng' },
];

export function generateWish(style, name) {
  const templates = WISH_TEMPLATES[style] || WISH_TEMPLATES.emotional;
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex](name || 'bạn');
}
