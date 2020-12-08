# Jupyter notebook
docker run -itd -p 8888:8888 -p 4040:4040 \
    -v ~/.aws:/root/.aws:ro --name glue_jupyter \
    amazon/aws-glue-libs:glue_libs_1.0.0_image_01 \
    /home/jupyter/jupyter_start.sh

# Zeppelin notebook
docker run -itd -p 8080:8080 -p 4040:4040 \
    -v ~/.aws:/root/.aws:ro --name glue_zeppelin \
    amazon/aws-glue-libs:glue_libs_1.0.0_image_01 \
    /home/zeppelin/bin/zeppelin.sh
    