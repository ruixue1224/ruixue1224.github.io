function getbrowserInfo() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('edg/')) return navigator.userAgent.match(/Edg\/([\d.]+)/)?.[1] ? `Edge ${navigator.userAgent.match(/Edg\/([\d.]+)/)[1]}` : 'Edge';
  if (ua.includes('chrome/') && !ua.includes('edg/')) return navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1] ? `Chrome ${navigator.userAgent.match(/Chrome\/([\d.]+)/)[1]}` : 'Chrome';
  if (ua.includes('firefox/')) return navigator.userAgent.match(/Firefox\/([\d.]+)/)?.[1] ? `Firefox ${navigator.userAgent.match(/Firefox\/([\d.]+)/)[1]}` : 'Firefox';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return navigator.userAgent.match(/Version\/([\d.]+)/)?.[1] ? `Safari ${navigator.userAgent.match(/Version\/([\d.]+)/)[1]}` : 'Safari';
  if (ua.includes('trident/') || ua.includes('msie')) return navigator.userAgent.match(/(MSIE |rv:)([\d.]+)/)?.[2] ? `IE ${navigator.userAgent.match(/(MSIE |rv:)([\d.]+)/)[2]}` : 'IE';
  return 'Unknown';
}

(function () {
  const content = document.querySelector('.ip_content');
  if (!content) return;

  const browser = getbrowserInfo();

  const render = ({ ip = '获取中...', country = '获取中...', province = '', city = '', district = '', isp = '' }) => {
    const location = [country, province, city, district].filter(Boolean).join(' · ') || '未知区域';
    content.innerHTML = `
      欢迎来自 <span class="p red">${location}</span> 的小伙伴<br>
      访问IP为： <span class="p cyan">${ip}</span><br>
      运营商： <span class="p green">${isp || '未知'}</span><br>
      浏览器版本：<span class="p blue">${browser}</span>
    `;
  };

  const fetchIpInfo = async () => {
    try {
      const res = await fetch('https://ipinfo.io/json', { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const isp = data.org ? data.org.replace(/^AS\d+\s+/i, '') : '未知';
      render({
        ip: data.ip || '未知IP',
        country: data.country || '未知国家',
        province: data.region || '未知省份',
        city: data.city || '未知城市',
        district: '',
        isp,
      });
    } catch {
      render({ ip: '未知IP', country: '未知区域', province: '', city: '', district: '', isp: '未知' });
    }
  };

  render({});
  fetchIpInfo();
})();
