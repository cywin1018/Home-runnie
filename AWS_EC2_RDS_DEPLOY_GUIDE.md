# AWS EC2 (Ubuntu) + RDS 배포 가이드 (Secret 파일 전송 방식)

이 문서는 `Home-runnie` 백엔드 프로젝트를 AWS 프리티어 우분투(Ubuntu) 환경에 자동 배포하기 위한 지침입니다. 특히, 민감한 환경 변수(`.env`)를 프라이빗 폴더에서 직접 서버로 전송하는 방식을 사용합니다.

---

## 🌐 0. 네트워크 인프라 (VPC & Subnet) 설정
처음 시작하신다면 가장 복잡한 부분입니다. 아래 설정을 먼저 확인하세요.

1. **기본 VPC 사용**: 굳이 새로 만들지 말고 AWS가 기본으로 제공하는 `Default VPC`를 사용하세요. (가장 쉽고 프리티어에 안전합니다.)
2. **서브넷(Subnet) 확인**: 
   - VPC 내의 서브넷 중 하나를 선택합니다. (보통 지역별로 several 개가 있습니다.)
   - **퍼블릭 IP 자동 할당**: 해당 서브넷 설정에서 `퍼블릭 IPv4 주소 자동 할당 활성화`가 체크되어 있는지 확인하세요. 이게 꺼져 있으면 EC2를 만들어도 접속용 IP가 생기지 않습니다.
     - *콘솔 경로: VPC > 서브넷 > 서브넷 선택 > 작업 > 서브넷 설정 편집 > 퍼블릭 IPv4 주소 자동 할당 활성화 체크*

---

## 🚀 1. AWS RDS (데이터베이스) 설정
RDS는 '프리티어' 마크가 붙은 설정을 선택해야 1년간 무료입니다.

1. **RDS 콘솔 접속** > **데이터베이스 생성**
2. **PostgreSQL** > **프리티어** 템플릿 선택
3. **설정**:
   - DB 인스턴스 식별자: `homerunnie-db`
   - 마스터 사용자: `postgres` / 마스터 암호 설정
4. **연결 (컴퓨팅 리소스)**:
   - **EC2 컴퓨팅 리소스에 연결**: **"EC2 컴퓨팅 리소스에 연결"**을 선택하고, 미리 만들어둔 EC2 인스턴스(`homerunnie-server`)를 선택하는 것이 **가장 권장되는(가장 쉽고 안전한) 방법**입니다. (이렇게 하면 AWS가 알아서 복잡한 VPC/보안 그룹 설정을 다 해줍니다!)
   - **퍼블릭 액세스**: **아니요** (EC2 연결을 선택하면 보통 '아니요'가 기본값이며, 보안상 이게 맞습니다. 만약 로컬 PC의 DBeaver 등에서 직접 DB를 보고 싶다면 '예'를 선택하세요.)
5. **추가 구성**: 초기 데이터베이스 이름 `jikgwan` 생성

---

## 📦 2. AWS ECR (컨테이너 저장소) 생성
1. **ECR 콘솔** > **Create repository**
2. **이름**: `jikgwan-backend`
3. 생성된 URI를 확인합니다.

---

## 💻 3. AWS EC2 (Ubuntu) 초기 설정
1. **인스턴스 시작**:
   - **AMI**: **Ubuntu 22.04 LTS**
   - **인스턴스 유형**: `t2.micro` (프리티어)
   - **네트워크 설정 (중요)**:
     - **VPC**: 위에서 확인한 `Default VPC` 선택
     - **서브넷**: 퍼블릭 IP 할당이 활성화된 서브넷 선택
     - **퍼블릭 IP 자동 할당**: `활성화(Enable)`로 되어 있는지 다시 한번 확인! (이게 되어야 외부에서 접속 가능합니다.)
2. **보안 그룹 (Inbound)**: 22(SSH), 80(HTTP), 443(HTTPS), 3030(API) 허용
3. **서버 초기 세팅 (SSH 접속 후)**:
   ```bash
   # 1. 패키지 업데이트 및 Docker 설치
   sudo apt-get update
   sudo apt-get install -y docker.io awscli docker-compose-v2
   
   # 2. 유저 권한 부여
   sudo usermod -aG docker ubuntu
   
   # 3. 서비스 디렉토리 생성
   mkdir -p ~/jikgwan
   
   # !!! 중요: 설정 후 로그아웃(exit) 하고 다시 접속해야 docker 권한이 적용됩니다.
   ```

---

## 🛡️ 4. IAM 사용자(User) 생성
GitHub Actions가 AWS ECR에 접근하고 배포를 수행하려면 권한이 있는 IAM 사용자가 필요합니다.

1. **IAM 콘솔 접속** > **사용자** > **사용자 생성**
2. **사용자 세부 정보**: 이름 입력 (예: `github-actions-deploy`) -> **다음**
3. **권한 설정**: **직접 정책 연결** 선택 후 아래 권한을 검색하여 체크 -> **다음** -> **생성**
   - `AmazonEC2ContainerRegistryPowerUser` (또는 `FullAccess`) - ECR 이미지 푸시를 위한 권한
4. **액세스 키 발급**:
   - 생성된 사용자 클릭 > **보안 자격 증명** 탭
   - **액세스 키 만들기** 버튼 클릭
   - **사용 사례**: `CLI (Command Line Interface)` 또는 `기타` 선택 -> **다음** -> **만들기**
   - 발급된 **액세스 키 (Access Key ID)**와 **비밀 액세스 키 (Secret Access Key)**를 메모장에 적어둡니다. (이 창을 닫으면 비밀 키는 다시 볼 수 없으니 주의!)

---

## 🔑 5. GitHub Secrets 등록
`Settings > Secrets and variables > Actions`에 아래 항목을 등록합니다.

- `AWS_ACCESS_KEY_ID`: 위 IAM에서 발급받은 액세스 키
- `AWS_SECRET_ACCESS_KEY`: 위 IAM에서 발급받은 비밀 액세스 키
- `AWS_REGION`: `ap-northeast-2` (서울)
- `ECR_REPOSITORY`: `jikgwan-backend`
- `EC2_HOST`: 서버 퍼블릭 IP
- `EC2_USER`: `ubuntu`
- `EC2_SSH_KEY`: `.pem` 키 내용 전체 (-----BEGIN RSA PRIVATE KEY----- 부터 끝까지)
- `PRIVATE_SUBMODULE_TOKEN`: (프라이빗 secret 폴더/서브모듈 접근 권한이 필요한 경우)

---

## 🛠 6. 배포 프로세스
1. GitHub Actions가 `apps/backend/secret/.env` 파일을 서버의 `~/jikgwan/.env`로 안전하게 복사합니다.
2. 서버에서 `docker-compose.prod.yaml`을 자동 생성하여 최신 이미지를 실행합니다.
3. 배포 포트는 `3030`을 사용합니다.
