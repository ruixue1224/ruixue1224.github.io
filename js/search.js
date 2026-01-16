var searchFunc = function(path, search_id, content_id) {
    'use strict';
    // ʹ��fetch���jQuery��ajax
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // ���� XML ����
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(data, 'text/xml');
            var items = xmlDoc.getElementsByTagName('item');

            // ��ȡ���������ͽ����Ԫ��
            var inputElement = document.getElementById(search_id);
            var resultElement = document.getElementById(content_id);

            // ���Ԫ���Ƿ����
            if (!inputElement || !resultElement) {
                console.error('Search input or result element not found.');
                return;
            }

            // ���������¼���ʵʱ����
            inputElement.addEventListener('input', function() {
                var query = this.value.trim();

                // �������Ϊ�գ���ս��
                if (query === '') {
                    resultElement.innerHTML = '';
                    return;
                }

                // �Ƴ�֮ǰ�Ľ��
                resultElement.innerHTML = '';

                // ���������������ʾƥ����
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var title = item.getElementsByTagName('title')[0].textContent;
                    var link = item.getElementsByTagName('link')[0].textContent;
                    var content = item.getElementsByTagName('content')[0]?.textContent || item.getElementsByTagName('description')[0]?.textContent || '';

                    // ��������Ƿ�ƥ���ѯ
                    if (title.toLowerCase().includes(query.toLowerCase()) || content.toLowerCase().includes(query.toLowerCase())) {
                        // ���������
                        var resultItem = document.createElement('div');
                        resultItem.className = 'search-result-item';

                        // ������������
                        var titleLink = document.createElement('a');
                        titleLink.href = link;
                        titleLink.textContent = title;
                        titleLink.className = 'search-result-title';

                        // ��������Ԥ��
                        var contentPreview = document.createElement('div');
                        contentPreview.textContent = content.substring(0, 100) + '...';
                        contentPreview.className = 'search-result-content';

                        // ���ӵ������
                        resultItem.appendChild(titleLink);
                        resultItem.appendChild(contentPreview);

                        // ���ӽ��������
                        resultElement.appendChild(resultItem);
                    }
                }

                // ���û���ҵ����
                if (resultElement.children.length === 0) {
                    resultElement.innerHTML = '<p>No results found for "' + query + '"</p>';
                }
            });
        })
        .catch(error => {
            console.error('Error fetching search data:', error);
            resultElement.innerHTML = '<p>Error fetching search data.</p>';
        });
};