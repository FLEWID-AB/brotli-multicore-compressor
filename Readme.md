# Brotli Multicore Compressor

This provides a fast way of compressing files within a folder. It will look at all the files recursively and if it matches any of the supported formats it will compress the files and add a `.br.[ext]` to the file.

It will automatically use all of the existing cores on your machine.

Pass `--dir=[your-directory]`.
