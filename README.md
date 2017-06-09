# CSV Export for Kibana Discover

It has been tested with Kibana v4.6.4 in Windows and Ubuntu environments.

## What's this?
This is a plugin that allows you to save the search results you are currently viewing in Kibana Discover as a CSV.
Other common plug-ins or Visualize's Export function only export data drawn on the UI.
However, this plug-in saves all data as CSV.

## How to Install?
The installation is completed by copying the file to the Kibana installation folder.
Generally, copy it to /opt/kibana/src/plugins/

    git clone https://github.com/goofygod/kibana-discover-csv-export.git
    cp -r kibana-discover-csv-export /opt/kibana/src/plugins/

After you copy the file, restart Kibana and it will detect the change in the plugin and automatically optimize it.

## How it work?
If the plug-in is installed correctly, the Save button will appear at the top of the Discover screen.

When you click the Save button, a screen showing the progress of CSV Export appears.
However, considering the performance of ElasticSearch server, only up to 500,000 files will be exported.
If more than 500,000 pieces of data are found, a message will be displayed.

---
---

# CSV Export for Kibana Discover

이것은 Windows 및 Ubuntu 환경의 Kibana v4.6.4에서 테스트 되었습니다.

## What's this?
이것은 Kibana Discover에서 현재 보고 있는 검색 결과를 CSV로 저장할 수 있게 해주는 플러그인입니다.
일반적인 다른 플러그인이나 Visualize의 Export 기능은 UI상에 그려진 데이터만 Export해 줍니다.
하지만 이 플러그인은 모든 데이터를 CSV로 저장해 줍니다.

## How to Install?
파일을 Kibana 설치 폴더에 복사하는 것으로 설치가 완료 됩니다.
일반적으로 /opt/kibana/src/plugins/ 하위에 복사해 주면 됩니다.

    git clone https://github.com/goofygod/kibana-discover-csv-export.git
    cp -r kibana-discover-csv-export /opt/kibana/src/plugins/

파일을 복사한 다음, Kibana를 재시작 하면 플러그인의 변경을 감지하여 자동으로 최적화 작업이 진행됩니다.

## How it work?
플러그인이 정상적으로 설치 되었다면, Discover 화면의 상단에 저장 버튼이 생겨납니다.

저장 버튼을 클릭하면, CSV Export의 진행 상태를 보여주는 화면이 나타납니다.
단, ElasticSearch 서버 성능을 고려하여, 최대 50만건까지만 Export가 됩니다.
50만건 이상의 데이터가 검색된 경우 이를 알려주는 메시지가 출력됩니다.

