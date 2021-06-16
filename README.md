# SAP CX Learning Paths
SET ENV VARS
source ./setenvvars.sh

BUILD
ng b

RUN AS ANGULAR APP
node src/server/index.js

RUN AS DOCKER APP
docker build -t kenlomax/pathsa:v8 .
docker push kenlomax/pathsa:v8
docker run -p3000:3000 --env accountName --env  mongokey --env mongoDatabaseName --env mongoport --env youtubeapikey --env  azurestorageimageaccount --env azurestorageimageaccountkey --env azurestorageimageacontainername dockerimage

CONVERGED CLOUD
https://dashboard.eu-nl-1.cloud.sap/monsoon3/home
GARDENER
https://dashboard.garden.canary.k8s.ondemand.com/namespace/garden-klxtrial/

DEPLOY AS K8S
Adjust env vars in pathsadeployment.yaml
Adjust image in pathsadeployment.yaml
kubectl --kubeconfig  /Users/d061192/Downloads/kubeconfig--klxtrial--q40tlog33j.yaml  get services
kubectl --kubeconfig  /Users/d061192/Downloads/kubeconfig--klxtrial--q40tlog33j.yaml  get pods
kubectl --kubeconfig  /Users/d061192/Downloads/kubeconfig--klxtrial--q40tlog33j.yaml logs pathsadeployment-55fbb7586f-cn75p

kubectl --kubeconfig /Users/d061192/Downloads/kubeconfig--klxtrial--q40tlog33j.yaml  apply -f pathsadeployment.yml
kubectl --kubeconfig /Users/d061192/Downloads/kubeconfig--klxtrial--q40tlog33j.yaml  delete -f pathsadeployment.yml

kubectl --kubeconfig /Users/d061192/Downloads/kubeconfig--klxtrial--q40tlog33j.yaml exec PODNAME  -- printenv
kubectl --kubeconfig  /Users/d061192/Downloads/kubeconfig--klxtrial--q40tlog33j.yaml  proxy

kubectl --kubeconfig /Users/d061192/Downloads/kubeconfig--klxtrial--wyvd0ally8.yaml apply -f pathsadeployment.yml

kubectl --kubeconfig /Users/d061192/Downloads/kubeconfig--klxtrial--wyvd0ally8.yaml edit kenlomax/pathsa:v7

kubectl --kubeconfig /Users/d061192/Downloads/kubeconfig--klxtrial--q40tlog33j.yaml apply -f /Users/d061192/SoftwareAcademy/Paths/mongodb/upskillingpaths/demo.yml

https://kubernetes.io/docs/concepts/services-networking/connect-applications-service/
kubectl  --kubeconfig /Users/d061192/Downloads/paths10-config.yml get pods -l run=my-nginx -o yaml | grep podIP
kubectl --kubeconfig /Users/d061192/Downloads/paths10-config.yml expose deployment/my-nginx
kubectl  --kubeconfig /Users/d061192/Downloads/paths10-config.yml  get svc my-nginx

-> http://<loadbalancer>:8081

A place for crowd sourcing the best material for SAPCX upskilling, with material recommended from our engineers.

[Based on this tutorial](https://docs.microsoft.com/en-gb/azure/cosmos-db/tutorial-develop-mongodb-nodejs)


